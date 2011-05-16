require 'rubygems'
require 'fssm'

class JammitWatch
  def self.compile(base, relative)
    puts "base = #{base}, relative = #{relative}"
    if relative == 'server.coffee'
      `coffee --output . --compile server.coffee`
    elsif base.end_with? 'bootstrap'
      `coffee --output compiled --compile #{File.join(base, relative)}`  
    elsif base.end_with? 'lib'
      `coffee --output compiled/lib --compile #{File.join(base, relative)}`
    elsif File.extname(relative) == '.coffee'
      `coffee --output compiled/mvc --compile #{File.join(base, relative)}`  
    elsif File.extname(relative) == '.js'
      `jammit -c config/jammit.yml -o public/js`
    else
      puts "Don't know how to handle change in #{base}/#{relative}"
    end
  end
  
  def self.monitor
    paths = {
      '.' => 'server.coffee', 
      'bootstrap' => '**/*.coffee',
      'controllers' => '**/*.coffee',
      'models' => '**/*.coffee',
      'views' => '**/*.coffee',
      'lib' => '**/*.coffee',
      'compiled' => '**/*.js' 
    }

    FSSM.monitor do |monitor|
      paths.each do |path, glob|    
        monitor.path path do |path|
          path.glob glob
          
            path.update { |base, relative| 
              puts "Change detected in #{base}/#{relative}"
              JammitWatch.compile(base, relative)
            }       
        end
      end
    end
  end
end

if $0 == __FILE__
  JammitWatch.monitor
end
